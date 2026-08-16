#!/usr/bin/env python3
"""
Generate idea-tracker.html from registration data.
Run from project root: python scripts/generate_idea_tracker.py
"""

import libsql
import json
import os
import subprocess
from pathlib import Path
from dotenv import load_dotenv

# Load env from backend
backend_env = Path(__file__).parent.parent / "backend" / ".env"
load_dotenv(backend_env)

def get_people_with_ideas():
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

    # Deduplicate by name, keep first occurrence
    seen_names = set()
    people = []

    for row in rows:
        form_data = json.loads(row[0])
        has_idea = form_data.get('do_you_hav', '')

        if 'I have an idea' in has_idea:
            name = form_data.get('name', 'Unknown').strip()

            # Skip duplicates
            if name.lower() in seen_names:
                continue
            seen_names.add(name.lower())

            idea = form_data.get('if_you_hav', '').strip()
            if not idea or idea == '-' or idea == '--':
                idea = 'Idea to be shared'

            people.append({'name': name, 'idea': idea})

    return people

def generate_html(people):
    people_json = json.dumps(people, indent=12)

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Idea Presentations - Build2Learn #34</title>
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
            max-width: 1200px;
            margin: 0 auto;
        }}

        h1 {{
            text-align: center;
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 8px;
            color: #fff;
        }}

        .subtitle {{
            text-align: center;
            color: #666;
            margin-bottom: 48px;
            font-size: 0.95rem;
        }}

        .grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
        }}

        .card {{
            background: #1a1a1a;
            border-radius: 16px;
            padding: 28px;
            cursor: pointer;
            transition: all 0.25s ease;
            border: 1px solid #2a2a2a;
            position: relative;
        }}

        .card:hover {{
            transform: translateY(-2px);
            border-color: #3a3a3a;
        }}

        .card.done {{
            background: #0f0f0f;
            border-color: #1a1a1a;
            opacity: 0.4;
        }}

        .card.done:hover {{
            opacity: 0.5;
        }}

        .card.done .name {{
            color: #555;
        }}

        .card.done .idea {{
            color: #444;
        }}

        .name {{
            font-size: 1.35rem;
            font-weight: 600;
            margin-bottom: 12px;
            color: #fff;
            line-height: 1.3;
        }}

        .idea {{
            font-size: 0.9rem;
            color: #888;
            line-height: 1.5;
            font-weight: 400;
        }}

        .remove-btn {{
            position: absolute;
            top: 12px;
            right: 12px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #2a2a2a;
            border: none;
            color: #666;
            font-size: 16px;
            cursor: pointer;
            opacity: 0;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }}

        .card:hover .remove-btn {{
            opacity: 1;
        }}

        .remove-btn:hover {{
            background: #ff4444;
            color: #fff;
        }}

        .counter {{
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: #1a1a1a;
            border-radius: 12px;
            display: inline-block;
            margin-left: 50%;
            transform: translateX(-50%);
        }}

        .counter-text {{
            font-size: 1rem;
            color: #888;
        }}

        .counter-number {{
            font-weight: 600;
            color: #fff;
        }}

        .card.removing {{
            animation: fadeOut 0.3s ease forwards;
        }}

        @keyframes fadeOut {{
            to {{
                opacity: 0;
                transform: scale(0.95);
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Idea Presentations</h1>
        <p class="subtitle">Click a card when done presenting</p>

        <div class="grid" id="cards">
        </div>

        <div class="counter">
            <span class="counter-text"><span class="counter-number" id="done-count">0</span> / <span id="total-count">0</span> completed</span>
        </div>
    </div>

    <script>
        const people = {people_json};

        const grid = document.getElementById('cards');
        const doneCount = document.getElementById('done-count');
        const totalCount = document.getElementById('total-count');

        let savedState = JSON.parse(localStorage.getItem('ideaTrackerState') || '{{}}');
        let removedCards = JSON.parse(localStorage.getItem('ideaTrackerRemoved') || '[]');

        function updateCounter() {{
            const visibleCards = document.querySelectorAll('.card:not(.removing)');
            const done = document.querySelectorAll('.card.done:not(.removing)').length;
            totalCount.textContent = visibleCards.length;
            doneCount.textContent = done;
        }}

        function renderCards() {{
            grid.innerHTML = '';

            people.forEach((person, index) => {{
                if (removedCards.includes(index)) return;

                const card = document.createElement('div');
                card.className = 'card' + (savedState[index] ? ' done' : '');
                card.innerHTML = `
                    <button class="remove-btn" data-index="${{index}}">&times;</button>
                    <div class="name">${{person.name}}</div>
                    <div class="idea">${{person.idea}}</div>
                `;

                card.addEventListener('click', (e) => {{
                    if (e.target.classList.contains('remove-btn')) return;
                    card.classList.toggle('done');
                    savedState[index] = card.classList.contains('done');
                    localStorage.setItem('ideaTrackerState', JSON.stringify(savedState));
                    updateCounter();
                }});

                card.querySelector('.remove-btn').addEventListener('click', (e) => {{
                    e.stopPropagation();
                    card.classList.add('removing');
                    setTimeout(() => {{
                        removedCards.push(index);
                        localStorage.setItem('ideaTrackerRemoved', JSON.stringify(removedCards));
                        card.remove();
                        updateCounter();
                    }}, 300);
                }});

                grid.appendChild(card);
            }});

            updateCounter();
        }}

        renderCards();
    </script>
</body>
</html>'''

    return html

def main():
    print("Fetching data from Turso...")
    people = get_people_with_ideas()
    print(f"Found {len(people)} people with ideas")

    html = generate_html(people)

    output_path = Path(__file__).parent / "idea-tracker.html"
    output_path.write_text(html)
    print(f"Generated: {output_path}")

    # Open in browser
    subprocess.run(["open", str(output_path)])
    print("Opened in browser")

if __name__ == "__main__":
    main()
