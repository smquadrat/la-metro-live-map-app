import json
import os
import requests
from dotenv import load_dotenv
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
    stations = []
    for feature in geojson_data["features"]:
        line = feature["properties"]["LINE"]
        station_name = feature["properties"]["STATION"]
        longitude, latitude = feature["geometry"]["coordinates"]
        stations.append({"line": line, "name": station_name, "latitude": latitude, "longitude": longitude})

    print(stations)

    return json.dumps({"items": stations})

@app.route("/train_locations")
def trains():
    train_data = requests.get("https://api.metro.net/LACMTA_Rail/vehicle_positions/all?geojson=false").json()

    # Extract train data and format it to be easily consumed by the frontend
    trains = []
    for train in train_data:
        try:
            train_id = train["trip"]["trip_id"]
            latitude = train["position"]["latitude"]
            longitude = train["position"]["longitude"]
            trains.append({"id": train_id, "latitude": latitude, "longitude": longitude})
        except KeyError:
            continue

    return json.dumps({"items": trains})

if __name__ == "__main__":
    app.run(debug=True)