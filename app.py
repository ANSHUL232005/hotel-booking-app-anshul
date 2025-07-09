import streamlit as st

st.set_page_config(page_title="Hotel Booking App", layout="wide")
st.title("🏨 Hotel Booking App")
st.write("Welcome to Anshul's Streamlit-based hotel booking platform!")

# Sample layout
with st.sidebar:
    st.header("User Filters")
    city = st.selectbox("Choose a City", ["Delhi", "Mumbai", "Bangalore"])
    guests = st.slider("Number of Guests", 1, 10, 2)

st.success(f"Showing hotels in {city} for {guests} guest(s).")
