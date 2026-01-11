# Comprehensive Turkish character encoding fix - V2
import re

# Read file with UTF-8
with open('src/components/views/VoiceView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# FULL replacement map for all observed corruptions
replacements = [
    # Regex pattern
    ('─ş', 'ğ'),
    ('ÔöÇ┼ş', 'ğ'),
    ('├ğ', 'ç'),
    ('─▒', 'ı'),
    ('─░', 'İ'),
    ('├╝', 'ü'),
    ('├£', 'Ü'),
    ('├Â', 'ö'),
    ('├û', 'Ö'),
    ('┼ş', 'ş'),
    ('┼Ş', 'Ş'),
    ('ÔöÇ┼Ş', 'Ş'),
    ('├ç', 'Ç'),
    ('­şîı', '🌍'),
]

for bad, good in replacements:
    content = content.replace(bad, good)

# Write back with UTF-8
with open('src/components/views/VoiceView.tsx', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print("Encoding fix V2 applied!")

# Verify
with open('src/components/views/VoiceView.tsx', 'r', encoding='utf-8') as f:
    check = f.read()

issues = ['─ş', '─▒', '├ğ', '├╝', '├£', '├Â', '├û', '┼ş', '┼Ş', '─░', 'ÔöÇ']
for issue in issues:
    count = check.count(issue)
    if count > 0:
        print(f"WARNING: Still found '{issue}' {count} times")
