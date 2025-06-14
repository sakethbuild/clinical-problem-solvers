from flask import Flask
import json
app=Flask(__name__)

@app.route('/')
def home():
    return {"message":"server is alive"}

app.run(debug=True)