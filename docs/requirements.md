# TynysAI - Requirements Specification

## Overview
TynysAI is an air quality monitoring app available on PC and Phone.
This document defines user stories and acceptance criteria for all planned fixes, customizations, and features.

---

## Fixes

### PC
- **Dashboard with Language Toggle**
  - AS A user, I want a dashboard with a language switcher
  - WHEN I open the app on PC
  - THEN I see a dashboard with a language toggle in the header (KZ / RU / EN)

### Phone
- **Optimized Mobile Layout**
  - AS A user, I want a clean and readable phone layout
  - WHEN I open the app on mobile
  - THEN the layout fits the screen with correct padding, font sizes, and spacing

---

## Customization

### PC
- **Vertical Account Sidebar**
  - AS A user, I want a full vertical account/navigation bar on the left
  - WHEN I am logged in on PC
  - THEN I see a vertical sidebar with my account info and navigation links
  - AND I can customize the color theme of the sidebar

### Phone
- **Location Button with Blue Highlight**
  - AS A user, I want a clearly visible location button
  - WHEN I tap the location button
  - THEN it highlights in blue and centers the map on my current location

---

## Features

### PC Features

- **NLP Natural Language Search**
  - AS A user, I want to search using plain language (e.g. "cleanest route today")
  - WHEN I type a natural language query in the search bar
  - THEN the NLP model parses it and returns relevant air quality results

- **NLP Chatbot with Historical Data**
  - AS A user, I want a chatbot that can answer questions about past air quality
  - WHEN I ask "how was the air yesterday in Almaty?"
  - THEN the bot returns a chart or text summary of historical data

### Phone Features

- **Route to Cleanest Area**
  - AS A user, I want to be routed to a place with good air quality
  - WHEN I tap the "Route" button
  - THEN the app shows a route to the nearest location with acceptable AQI

- **Nearby Device/Sensor Markers**
  - AS A user, I want to see nearby air quality sensors on the map
  - WHEN I open the map view
  - THEN sensor markers appear around my current location with AQI values

- **Scrollable Map**
  - AS A user, I want the map to be scrollable under other UI elements
  - WHEN I scroll down on the phone screen
  - THEN the map expands and I can pan/zoom freely

- **Historical Data View**
  - AS A user, I want to see past air quality data
  - WHEN I tap a sensor or location
  - THEN I see a chart or list of historical AQI readings

- **Location Button — Exact Place with Good Air Quality**
  - AS A user, I want the app to take me to the nearest clean air spot
  - WHEN I tap the locate button
  - THEN the app navigates me to the exact nearest place with good air quality
