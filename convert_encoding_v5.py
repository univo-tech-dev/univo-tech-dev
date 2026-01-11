
import codecs
import os

try:
    if not os.path.exists("old_VoiceView_version5.tsx"):
        print("File not found.")
    else:
        with codecs.open("old_VoiceView_version5.tsx", "r", "utf-16") as source:
            content = source.read()
        with codecs.open("old_VoiceView_version5_utf8.tsx", "w", "utf-8") as target:
            target.write(content)
        print("Conversion successful.")
except Exception as e:
    print(f"Error: {e}")
