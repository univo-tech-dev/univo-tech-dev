import os

path = 'src/components/views/VoiceView.tsx'

with open(path, 'rb') as f:
    raw = f.read()

content = raw.decode('utf-8', errors='replace')

# Comprehensive replacement map based on observed corruptions
replacements = {
    '─▒': 'ı',
    '─░': 'İ',
    '├ğ': 'ğ',  
    '─ş': 'ğ',  # This can be ğ in some contexts
    '├╝': 'ü',
    '├£': 'Ü',
    '├Â': 'ö',
    '├û': 'Ö',
    '┼ş': 'ş',
    '┼Ş': 'Ş',
    '├ç': 'ç',
    '├ç': 'Ç',
    '­şîı': '🌍',  # Globe emoji for global mode
    'Eri┼şime Kapal─▒': 'Erişime Kapalı',
    'S─▒n─▒rlar kalk─▒yor': 'Sınırlar kalkıyor',
    'D├╝nyan─▒n d├Ârt bir yan─▒ndaki ├╝niversite ├Â─şrencileriyle ├ğok yak─▒nda burada bulu┼şacaks─▒n': 'Dünyanın dört bir yanındaki üniversite öğrencileriyle çok yakında burada buluşacaksın',
    "D├£NYA G├£NDEM─░": "DÜNYA GÜNDEMİ",
    "SERBEST K├£RS├£": "SERBEST KÜRSÜ",
    'Oyunuz geri al─▒nd─▒': 'Oyunuz geri alındı',
    'Oy kullanmak i├ğin giri┼ş yapmal─▒s─▒n─▒z': 'Oy kullanmak için giriş yapmalısınız',
    'giri┼ş yapmal─▒s─▒n': 'giriş yapmalısın',
    'Payla┼ş─▒m yapmak i├ğin': 'Paylaşım yapmak için',
    "Ge├ğ": "Geç",
    "├Â─şrenci": "öğrenci",
    "├ç": "ç",
}

for bad, good in replacements.items():
    content = content.replace(bad, good)

# Also fix remaining individual chars
content = content.replace('─▒', 'ı')
content = content.replace('─░', 'İ')
content = content.replace('├ğ', 'ğ')
content = content.replace('├╝', 'ü')
content = content.replace('├£', 'Ü')
content = content.replace('├Â', 'ö')
content = content.replace('├û', 'Ö')
content = content.replace('┼ş', 'ş')
content = content.replace('┼Ş', 'Ş')
content = content.replace('├ç', 'ç')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Encoding fixed!")
print("Checking for remaining issues...")

# Verify
with open(path, 'r', encoding='utf-8') as f:
    check = f.read()
    
issues = ['─▒', '─░', '├ğ', '├╝', '├£', '├Â', '├û', '┼ş', '┼Ş', '├ç']
for issue in issues:
    if issue in check:
        print(f"WARNING: Still found: {issue}")
