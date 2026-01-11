
import codecs
import os

try:
    if not os.path.exists("old_VoiceStatsWidget.tsx"):
        print("File not found.")
    else:
        with codecs.open("old_VoiceStatsWidget.tsx", "r", "utf-16") as source:
            content = source.read()
        with codecs.open("old_VoiceStatsWidget_utf8.tsx", "w", "utf-8") as target:
            target.write(content)
        print("Conversion successful.")
except Exception as e:
    print(f"Error: {e}")
