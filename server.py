import streamlit as st
import re
import pandas as pd
import os
from datetime import datetime


def is_valid_email(email):
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(pattern, email) is not None


def is_valid_phone(phone):
    pattern = r"^\d{10}$"
    return re.match(pattern, phone) is not None


def is_valid_github(url):
    # Modified pattern to allow optional trailing slash
    pattern = r"^https?://github\.com/[\w-]+(?:/[\w-]+)*/?$"
    return re.match(pattern, url) is not None


def save_to_csv(data):
    filename = "build2learn_registrations.csv"
    data["Registration Time"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    df_new = pd.DataFrame([data])

    try:
        if os.path.exists(filename):
            df_existing = pd.read_csv(filename)
            df_updated = pd.concat([df_existing, df_new], ignore_index=True)
        else:
            df_updated = df_new

        df_updated.to_csv(filename, index=False)
        return True
    except Exception as e:
        st.error(f"Error saving data: {str(e)}")
        return False


def display_technology_summary():
    try:
        df = pd.read_csv("build2learn_registrations.csv")
        # Extract all technologies and clean them
        all_techs = []
        for tech_string in df["Technology"]:
            # Split the string by common separators and clean each technology
            techs = [t.strip().lower() for t in re.split(r"[,\s]+", str(tech_string))]
            all_techs.extend(techs)

        # Count unique technologies
        tech_counts = pd.Series(all_techs).value_counts()

        st.sidebar.markdown("### Technology Distribution")

        # Create a formatted display of technologies and their counts
        for tech, count in tech_counts.items():
            if tech and tech != "nan":  # Avoid empty or NaN values
                st.sidebar.write(f"- {tech}: {count}")

    except Exception as e:
        st.sidebar.write("No registrations yet!")


@st.dialog("Final Confirmation Required 🐼")
def confirmation_dialog(registration_data):
    st.image("https://i.imgur.com/silyfx7.jpeg", width=300)
    st.markdown(
        """
    ### Before we make it official... 

    Our little panda friend here gets sad when people register but don't come 🥺

    ⚠️ Take a moment to think:
    - Can you really make it? 
    - Are you excited to learn and build with us? 
    - Ready to be part of our awesome community? 

    If you're 100% committed to joining us for this amazing journey, 
    please type 'yes' below to complete your registration! 🌟
    """
    )

    confirmation = st.text_input("Type 'yes' to confirm your registration:")

    if st.button("Submit Confirmation"):
        if confirmation.lower() == "yes":
            if save_to_csv(registration_data):
                st.session_state.registration_status = "success"
            else:
                st.session_state.registration_status = "error"
        else:
            st.session_state.registration_status = "invalid"
        st.rerun()


def main():
    st.title("Build2Learn Registration Bot 🤖")

    # Initialize session states
    if "registration_complete" not in st.session_state:
        st.session_state.registration_complete = False
    if "registration_status" not in st.session_state:
        st.session_state.registration_status = None

    st.markdown(
        """
    ### Welcome to build2learn - Where Innovation Meets Community! 

    Imagine a hackathon, but with a twist!🤔
    
    It's not just about building incredible micro products; it's about forging lifelong connections 
    with like-minded individuals who share your passion for innovation! 🤝💡
    
    At build2learn, we believe that magic happens when engineers come together to do what they love - BUILD! 🛠
    """
    )

    if not st.session_state.registration_complete:
        with st.form("registration_form"):
            name = st.text_input("Name *")
            email = st.text_input("Email *")
            phone = st.text_input("Phone Number *")

            role = st.selectbox(
                "How can you help us in this build2learn? *",
                ["Build & learn new products/technologies", "Mentor projects/ideas"],
            )

            status = st.selectbox(
                "You are a *", ["Student", "Fresher", "Experienced Professional"]
            )

            tech_stack = st.text_input(
                "What technology do you want to work with? (Ex - python, java, C) *"
            )

            has_project = st.radio(
                "Do you have a project idea to build?", ["Yes", "No"]
            )
            project_description = (
                st.text_area("If yes, tell us more about your project idea")
                if has_project == "Yes"
                else ""
            )

            github_link = st.text_input("Your GitHub page link *")
            laptop_model = st.text_input("Laptop model *")

            submitted = st.form_submit_button("Submit Registration")

            if submitted:
                if not all([name, email, phone, tech_stack, github_link, laptop_model]):
                    st.error("Please fill all required fields marked with *")
                elif not is_valid_email(email):
                    st.error("Please enter a valid email address")
                elif not is_valid_phone(phone):
                    st.error("Please enter a valid 10-digit phone number")
                elif not is_valid_github(github_link):
                    st.error("Please enter a valid GitHub URL")
                else:
                    registration_data = {
                        "Name": name,
                        "Email": email,
                        "Phone": phone,
                        "Role": role,
                        "Status": status,
                        "Technology": tech_stack,
                        "Has Project": has_project,
                        "Project Description": project_description,
                        "GitHub": github_link,
                        "Laptop Model": laptop_model,
                    }
                    confirmation_dialog(registration_data)

        # Handle registration status after dialog closes
        if st.session_state.registration_status == "success":
            st.balloons()
            st.success(
                """
            🎉 WOOHOO! You're officially part of Build2Learn! 🎉
            
            🌟 We're so excited to have you join our community of builders and innovators!
            
            📅 Save the date and get ready for an amazing experience!
            
            💪 Time to turn those amazing ideas into reality!
            """
            )
            st.session_state.registration_complete = True
            st.session_state.registration_status = None
        elif st.session_state.registration_status == "error":
            st.error("There was an error saving your registration. Please try again.")
            st.session_state.registration_status = None
        elif st.session_state.registration_status == "invalid":
            st.warning("Please type 'yes' to confirm your registration.")
            st.session_state.registration_status = None

    else:
        st.success("You have already registered! 🎉")
        if st.button("Register Another Person"):
            st.session_state.registration_complete = False
            st.session_state.registration_status = None
            st.rerun()

    # Show technology summary in sidebar
    if st.sidebar.checkbox("Show Technology Distribution"):
        display_technology_summary()


if __name__ == "__main__":
    main()
