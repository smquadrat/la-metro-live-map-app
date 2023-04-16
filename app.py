import json
from dotenv import load_dotenv
import os
import requests
from flask import Flask, render_template

app = Flask(__name__)

load_dotenv()

MAPTILER_ACCESS_TOKEN = os.getenv("MAPTILER_ACCESS_TOKEN")
MAPTILER_TILESET_ID = "basic-v2-light"

with open("static/lines.geojson") as f:
        geojson_data = json.load(f)

@app.route("/")
def map():
    maptiler_map = {
        "access_token": MAPTILER_ACCESS_TOKEN,
        "center": [-118.2437, 34.0522],
        "zoom": 10,
        "tileset_id": MAPTILER_TILESET_ID
    }

    return render_template("map.html", maptiler_map=json.dumps(maptiler_map))

@app.route("/stations")
def stations():
    stations = [{"line": feature["properties"]["LINE"], "name": feature["properties"]["STATION"], "latitude": feature["geometry"]["coordinates"][1], "longitude": feature["geometry"]["coordinates"][0]}
                for feature in geojson_data["features"]]
    
    return json.dumps({"items": stations})

@app.route("/train_locations")
def trains():
    train_data = requests.get("https://api.metro.net/LACMTA_Rail/vehicle_positions/all?geojson=false").json()

    # Extract train data and format it to be easily consumed by the frontend using list comprehension
    trains = [{"id": train["trip"]["trip_id"], "latitude": train["position"]["latitude"], "longitude": train["position"]["longitude"]}
              for train in train_data if "trip" in train and "trip_id" in train["trip"] and "position" in train]

    return json.dumps({"items": trains})

if __name__ == "__main__":
    app.run(debug=True)