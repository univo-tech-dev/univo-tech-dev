# Fix encoding in all affected files
files = [
    'src/components/views/VoiceStatsWidget.tsx',
    'src/components/voice/CommentSystem.tsx'
]

replacements = [
    ('─ş', 'ğ'),
    ('─▒', 'ı'),
    ('─░', 'İ'),
    ('├ğ', 'ç'),
    ('├╝', 'ü'),
    ('├£', 'Ü'),
    ('├Â', 'ö'),
    ('├û', 'Ö'),
    ('┼ş', 'ş'),
    ('┼Ş', 'Ş'),
    ('├ç', 'Ç'),
    ('Ô£ô', '✓'),
    ('Geğ', 'Geç'),
]

for filepath in files:
    try:
        content = open(filepath, 'r', encoding='utf-8').read()
        original = content
        for bad, good in replacements:
            content = content.replace(bad, good)
        if content != original:
            open(filepath, 'w', encoding='utf-8', newline='\r\n').write(content)
            print(f"Fixed: {filepath}")
        else:
            print(f"No changes needed: {filepath}")
    except Exception as e:
        print(f"Error with {filepath}: {e}")

print("\nDone!")
