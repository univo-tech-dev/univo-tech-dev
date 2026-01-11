
import codecs

try:
    with codecs.open("old_VoiceView_temp.tsx", "r", "utf-16") as source:
        content = source.read()
    with codecs.open("old_VoiceView_utf8.tsx", "w", "utf-8") as target:
        target.write(content)
    print("Conversion successful.")
except Exception as e:
    print(f"Error: {e}")
