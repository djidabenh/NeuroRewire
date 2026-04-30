from flask import Flask, render_template, abort
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

VALID_CATEGORIES = {
    "memory",
    "attention",
    "coordination",
    "robot",
    "trajectory",
    "language",
    "quiz",
}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/settings")
def settings():
    return render_template("settings.html")

@app.route("/progress")
def progress():
    return render_template("progress.html")

@app.route("/avc")
def avc():
    return render_template("avc.html")

@app.route("/exercises")
def exercises():
    return render_template("exercises.html")

@app.route("/exercises/<category>")
def exercise_category(category):
    if category not in VALID_CATEGORIES:
        abort(404)
    return render_template("exercise_category.html", category=category)

@app.route("/games/memory-images")
def game_memory_images():
    return render_template("game_memory_images.html")

@app.route("/games/memory-order")
def game_memory_order():
    return render_template("game_memory_order.html")

@app.route("/games/memory-pairs")
def game_memory_pairs():
    return render_template("game_memory_pairs.html")

@app.route("/games/attention-intruder")
def game_attention_intruder():
    return render_template("game_attention_intruder.html")

@app.route("/games/attention-click-target")
def game_attention_click_target():
    return render_template("game_attention_click_target.html")

@app.route("/games/attention-scene-search")
def game_attention_scene_search():
    return render_template("game_attention_scene_search.html")

@app.route("/games/coordination-catch-fruits")
def game_coordination_catch_fruits():
    return render_template("game_coordination_catch_fruits.html")

@app.route("/games/coordination-drag-drop")
def game_coordination_drag_drop():
    return render_template("game_coordination_drag_drop.html")

@app.route("/games/coordination-tap-target")
def game_coordination_tap_target():
    return render_template("game_coordination_tap_target.html")

@app.route("/games/quiz-general")
def game_quiz_general():
    return render_template("game_quiz_general.html")

@app.route("/games/quiz-rapid-compare")
def game_quiz_rapid_compare():
    return render_template("game_quiz_rapid_compare.html")

@app.route("/games/quiz-rapid-math")
def game_quiz_rapid_math():
    return render_template("game_quiz_rapid_math.html")

@app.route("/games/trajectory-connect-dots")
def game_trajectory_connect_dots():
    return render_template("game_trajectory_connect_dots.html")

@app.route("/games/trajectory-draw-shapes")
def game_trajectory_draw_shapes():
    return render_template("game_trajectory_draw_shapes.html")

@app.route("/games/trajectory-maze")
def game_trajectory_maze():
    return render_template("game_trajectory_maze.html")

@app.route("/games/language-word-image")
def game_language_word_image():
    return render_template("game_language_word_image.html")

@app.route("/games/language-complete-word")
def game_language_complete_word():
    return render_template("game_language_complete_word.html")

@app.route("/games/language-categorize")
def game_language_categorize():
    return render_template("game_language_categorize.html")

if __name__ == "__main__":
    app.run(debug=True)

