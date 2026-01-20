
// In the environment, native fetch might be available.

async function inspect() {
    try {
        const res = await fetch('https://bais.bilkent.edu.tr/menu/');
        const html = await res.text();
        
        console.log("HTML Sample:");
        // Print usage of 'Tabildot' to see surroundings
        const index = html.indexOf('Tabildot Fiks Menü - Öğlen');
        if (index !== -1) {
             console.log(html.substring(index - 500, index + 2000));
        } else {
             console.log("Could not find 'Tabildot Fiks Menü - Öğlen'");
             console.log(html.substring(0, 2000));
        }
    } catch (e) {
        console.error(e);
    }
}

inspect();
