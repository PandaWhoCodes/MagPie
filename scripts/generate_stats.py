#!/usr/bin/env python3
"""
Generate stats.html from registration data.
Run from project root: python scripts/generate_stats.py
"""

import libsql
import json
import os
import subprocess
from pathlib import Path
from collections import Counter
from dotenv import load_dotenv

# Load env from backend
backend_env = Path(__file__).parent.parent / "backend" / ".env"
load_dotenv(backend_env)


def get_registrations():
    db_url = os.environ.get('TURSO_DATABASE_URL', '').replace('libsql://', 'https://')
    auth_token = os.environ.get('TURSO_AUTH_TOKEN', '')

    conn = libsql.connect(db_url, auth_token=auth_token)

    cursor = conn.execute('''
        SELECT r.form_data
        FROM registrations r
        JOIN events e ON r.event_id = e.id
        WHERE e.is_active = 1
        ORDER BY r.created_at
    ''')

    rows = cursor.fetchall()
    return [json.loads(row[0]) for row in rows]


def analyze_data(registrations):
    # Deduplicate by phone number
    seen_phones = set()
    unique_regs = []
    for reg in registrations:
        phone = reg.get('phone', '')
        if phone and phone not in seen_phones:
            seen_phones.add(phone)
            unique_regs.append(reg)
        elif not phone:
            unique_regs.append(reg)

    total = len(unique_regs)

    # Who's coming
    roles = Counter(r.get('you_are_a', 'Unknown') for r in unique_regs if r.get('you_are_a'))

    # How they want to help
    help_type = Counter()
    for r in unique_regs:
        h = r.get('how_can_yo', '')
        if 'Mentor' in h:
            help_type['Mentor'] += 1
        elif 'Build' in h:
            help_type['Build & Learn'] += 1

    # Ideas
    ideas = Counter()
    for r in unique_regs:
        idea = r.get('do_you_hav', '')
        if 'I have an idea' in idea:
            ideas['Has an Idea'] += 1
        elif 'collaborate' in idea:
            ideas['Want to Collaborate'] += 1
        elif 'help' in idea.lower():
            ideas['Needs Help with Idea'] += 1

    # Parking
    parking = Counter()
    for r in unique_regs:
        p = r.get('parking_re', '')
        if '2 wheeler' in p:
            parking['2 Wheeler'] += 1
        elif '4 wheeler' in p:
            parking['4 Wheeler'] += 1
        else:
            parking['No Parking'] += 1

    # Technologies
    tech_counter = Counter()
    for r in unique_regs:
        tech = r.get('what_techn', '').lower()
        if 'python' in tech:
            tech_counter['Python'] += 1
        if 'ai' in tech or 'ml' in tech:
            tech_counter['AI/ML'] += 1
        if 'full' in tech and 'stack' in tech:
            tech_counter['Full Stack'] += 1
        if 'java' in tech and 'javascript' not in tech:
            tech_counter['Java'] += 1
        if 'react' in tech:
            tech_counter['React'] += 1
        if 'gen' in tech and 'ai' in tech:
            tech_counter['Gen AI'] += 1

    return {
        'total': total,
        'roles': dict(roles),
        'help_type': dict(help_type),
        'ideas': dict(ideas),
        'parking': dict(parking),
        'tech': dict(tech_counter),
        'people': unique_regs
    }


def generate_stat_row(label, count, total, color_class):
    pct = (count / total * 100) if total > 0 else 0
    return f'''<div class="stat-row">
                    <span class="stat-label">{label}</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar {color_class}" style="width: {pct:.1f}%"></div>
                    </div>
                    <span class="stat-value">{count}</span>
                </div>'''


def generate_person_card(person):
    name = person.get('name', 'Unknown').strip()
    org = person.get('your_organ', '-').strip()
    if len(org) > 25:
        org = org[:22] + '...'

    tags = []

    # Role tag
    role = person.get('you_are_a', '')
    if 'Student' in role:
        tags.append('<span class="tag student">Student</span>')
    elif 'Fresher' in role:
        tags.append('<span class="tag fresher">Fresher</span>')

    # Mentor tag
    if 'Mentor' in person.get('how_can_yo', ''):
        tags.append('<span class="tag mentor">Mentor</span>')

    # Idea tag
    idea_status = person.get('do_you_hav', '')
    idea_title = person.get('if_you_hav', '').strip()
    if 'I have an idea' in idea_status:
        if idea_title and idea_title not in ['-', '--', '']:
            short_title = idea_title[:20] + '...' if len(idea_title) > 20 else idea_title
            tags.append(f'<span class="tag has-idea">Idea: {short_title}</span>')
        else:
            tags.append('<span class="tag has-idea">Has Idea</span>')
    elif 'help' in idea_status.lower():
        tags.append('<span class="tag">Needs Idea Help</span>')

    # Tech tag
    tech = person.get('what_techn', '').strip()
    if tech and tech not in ['-', '--']:
        short_tech = tech[:20] + '...' if len(tech) > 20 else tech
        tags.append(f'<span class="tag">{short_tech}</span>')

    tags_html = '\n                    '.join(tags)

    return f'''<div class="person-card">
                <div class="person-name">{name}</div>
                <div class="person-org">{org}</div>
                <div class="person-tags">
                    {tags_html}
                </div>
            </div>'''


def generate_html(stats):
    total = stats['total']

    # Roles section
    roles = stats['roles']
    role_rows = []
    colors = ['color-1', 'color-2', 'color-3']
    for i, (role, count) in enumerate(sorted(roles.items(), key=lambda x: -x[1])):
        role_rows.append(generate_stat_row(role, count, total, colors[i % len(colors)]))
    roles_html = '\n                '.join(role_rows)

    # Help type section
    help_type = stats['help_type']
    help_rows = []
    for i, (h, count) in enumerate(sorted(help_type.items(), key=lambda x: -x[1])):
        help_rows.append(generate_stat_row(h, count, total, ['color-5', 'color-2'][i % 2]))
    help_html = '\n                '.join(help_rows)

    # Ideas section
    ideas = stats['ideas']
    idea_rows = []
    idea_colors = ['color-5', 'color-1', 'color-3']
    for i, (idea, count) in enumerate(sorted(ideas.items(), key=lambda x: -x[1])):
        idea_rows.append(generate_stat_row(idea, count, total, idea_colors[i % len(idea_colors)]))
    ideas_html = '\n                '.join(idea_rows)

    # Parking section
    parking = stats['parking']
    parking_rows = []
    parking_colors = ['color-2', 'color-1', 'color-3']
    parking_order = ['2 Wheeler', '4 Wheeler', 'No Parking']
    for i, p in enumerate(parking_order):
        if p in parking:
            parking_rows.append(generate_stat_row(p, parking[p], total, parking_colors[i]))
    parking_html = '\n                '.join(parking_rows)

    # Tech cloud
    tech = stats['tech']
    tech_tags = []
    for t, count in sorted(tech.items(), key=lambda x: -x[1]):
        css_class = 'tech-tag hot' if count >= 5 else 'tech-tag'
        tech_tags.append(f'<span class="{css_class}">{t} ({count})</span>')
    tech_html = '\n                '.join(tech_tags)

    # People cards
    people_cards = []
    for person in stats['people']:
        if person.get('name'):
            people_cards.append(generate_person_card(person))
    people_html = '\n            '.join(people_cards)

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Build2Learn #34 - Registration Stats</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0a0a0a;
            min-height: 100vh;
            padding: 40px 20px;
            color: #fff;
        }}

        .container {{
            max-width: 1400px;
            margin: 0 auto;
        }}

        h1 {{
            text-align: center;
            font-size: 2.2rem;
            font-weight: 700;
            margin-bottom: 8px;
            color: #fff;
        }}

        .subtitle {{
            text-align: center;
            color: #666;
            margin-bottom: 48px;
            font-size: 1rem;
        }}

        .big-number {{
            text-align: center;
            margin-bottom: 48px;
        }}

        .big-number .number {{
            font-size: 5rem;
            font-weight: 700;
            color: #fff;
            line-height: 1;
        }}

        .big-number .label {{
            font-size: 1.1rem;
            color: #666;
            margin-top: 8px;
        }}

        .grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 24px;
            margin-bottom: 40px;
        }}

        .card {{
            background: #141414;
            border-radius: 16px;
            padding: 28px;
            border: 1px solid #222;
        }}

        .card h2 {{
            font-size: 0.85rem;
            font-weight: 600;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 20px;
        }}

        .stat-row {{
            display: flex;
            align-items: center;
            margin-bottom: 16px;
        }}

        .stat-row:last-child {{
            margin-bottom: 0;
        }}

        .stat-label {{
            flex: 0 0 180px;
            font-size: 0.95rem;
            color: #aaa;
        }}

        .stat-bar-container {{
            flex: 1;
            height: 32px;
            background: #1a1a1a;
            border-radius: 8px;
            overflow: hidden;
            margin-right: 16px;
        }}

        .stat-bar {{
            height: 100%;
            border-radius: 8px;
            transition: width 0.5s ease;
        }}

        .stat-value {{
            flex: 0 0 40px;
            font-size: 1.1rem;
            font-weight: 600;
            color: #fff;
            text-align: right;
        }}

        .color-1 {{ background: linear-gradient(90deg, #6366f1, #8b5cf6); }}
        .color-2 {{ background: linear-gradient(90deg, #22c55e, #4ade80); }}
        .color-3 {{ background: linear-gradient(90deg, #f59e0b, #fbbf24); }}
        .color-4 {{ background: linear-gradient(90deg, #ef4444, #f87171); }}
        .color-5 {{ background: linear-gradient(90deg, #06b6d4, #22d3ee); }}

        .people-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
        }}

        .person-card {{
            background: #1a1a1a;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #2a2a2a;
        }}

        .person-name {{
            font-size: 1.1rem;
            font-weight: 600;
            color: #fff;
            margin-bottom: 4px;
        }}

        .person-org {{
            font-size: 0.85rem;
            color: #666;
            margin-bottom: 12px;
        }}

        .person-tags {{
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }}

        .tag {{
            font-size: 0.75rem;
            padding: 4px 10px;
            border-radius: 20px;
            background: #2a2a2a;
            color: #888;
        }}

        .tag.mentor {{
            background: #1a3a2a;
            color: #4ade80;
        }}

        .tag.has-idea {{
            background: #2a1a3a;
            color: #a78bfa;
        }}

        .tag.student {{
            background: #1a2a3a;
            color: #60a5fa;
        }}

        .tag.fresher {{
            background: #3a2a1a;
            color: #fbbf24;
        }}

        .tech-cloud {{
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }}

        .tech-tag {{
            font-size: 0.9rem;
            padding: 8px 16px;
            border-radius: 8px;
            background: #1a1a1a;
            color: #aaa;
            border: 1px solid #2a2a2a;
        }}

        .tech-tag.hot {{
            background: linear-gradient(135deg, #1a1a3a, #2a1a4a);
            border-color: #4a3a6a;
            color: #a78bfa;
        }}

        .section-title {{
            font-size: 1.3rem;
            font-weight: 600;
            color: #fff;
            margin: 48px 0 24px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Build2Learn #34</h1>
        <p class="subtitle">January 31st, 2026 - Entrans Technologies</p>

        <div class="big-number">
            <div class="number">{total}</div>
            <div class="label">Registered Participants</div>
        </div>

        <div class="grid">
            <div class="card">
                <h2>Who's Coming</h2>
                {roles_html}
            </div>

            <div class="card">
                <h2>How They Want to Help</h2>
                {help_html}
            </div>

            <div class="card">
                <h2>Project Ideas</h2>
                {ideas_html}
            </div>

            <div class="card">
                <h2>Parking Needed</h2>
                {parking_html}
            </div>
        </div>

        <h3 class="section-title">Technologies</h3>
        <div class="card">
            <div class="tech-cloud">
                {tech_html}
            </div>
        </div>

        <h3 class="section-title">All Participants</h3>
        <div class="people-grid">
            {people_html}
        </div>
    </div>
</body>
</html>'''

    return html


def main():
    print("Fetching data from Turso...")
    registrations = get_registrations()
    print(f"Found {len(registrations)} registrations")

    print("Analyzing data...")
    stats = analyze_data(registrations)
    print(f"Unique participants: {stats['total']}")

    html = generate_html(stats)

    output_path = Path(__file__).parent / "stats.html"
    output_path.write_text(html)
    print(f"Generated: {output_path}")

    # Open in browser
    subprocess.run(["open", str(output_path)])
    print("Opened in browser")


if __name__ == "__main__":
    main()
