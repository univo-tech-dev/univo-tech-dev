# Comprehensive encoding check for VoiceView.tsx
content = open('src/components/views/VoiceView.tsx', 'r', encoding='utf-8').read()
lines = content.split('\n')

# Characters that indicate encoding problems
bad_patterns = [
    '─', '├', '┼', 'Ô', 
    '─ş', '─▒', '─░', 
    '├ğ', '├╝', '├£', '├Â', '├û', '├ç',
    '┼ş', '┼Ş',
    'ğğ',  # double ğ
    'Geğ',  # should be Geç
]

found_issues = []
for i, line in enumerate(lines):
    for pattern in bad_patterns:
        if pattern in line:
            # Get a snippet of the problematic area
            idx = line.find(pattern)
            snippet = line[max(0,idx-20):min(len(line),idx+30)]
            found_issues.append(f"Line {i+1}: Found '{pattern}' in: ...{snippet}...")
            break

if found_issues:
    print(f"FOUND {len(found_issues)} ENCODING ISSUES:")
    for issue in found_issues:
        print(issue)
else:
    print("✓ NO ENCODING ISSUES FOUND!")
    
# Also check total file for Turkish chars to confirm they exist
turkish_chars = ['ğ', 'ş', 'ı', 'ö', 'ü', 'ç', 'Ğ', 'Ş', 'İ', 'Ö', 'Ü', 'Ç']
print("\nTurkish character count:")
for tc in turkish_chars:
    count = content.count(tc)
    if count > 0:
        print(f"  {tc}: {count}")
