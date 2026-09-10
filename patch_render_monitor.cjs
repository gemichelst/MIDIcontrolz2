const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

code = code.replace(/case 'pc':       return \`\${ts}<span class="msg-pc">⬡ PC \${m\.pc}  Ch\${m\.ch\+1}<\/span>\`;/,
`case 'pc':       return \`\${ts}<span class="msg-pc">⬡ PC \${m.pc}  Ch\${m.ch+1}</span>\`;
      case 'panic':    return \`\${ts}<span style="color:#ef4444;font-weight:bold;">🚨 \${m.message}</span>\`;`);

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('renderMonitor patched');
