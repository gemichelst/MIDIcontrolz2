const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const regex = /switch \(m\.type\) \{[\s\S]*?case 'note_on':  return `\${ts}<span class="msg-note">▶ Note On  Ch\${m\.ch\+1} \${noteName\(m\.note\)} \(\${m\.note}\) vel:\${m\.vel}<\/span>`;[\s\S]*?\}/;

const replacement = `switch (m.type) {
      case 'note_on':  return \`\${ts}<span class="msg-note" style="color:#3b82f6;font-weight:bold;">▶ Note On  Ch\${m.ch+1} \${noteName(m.note)} (\${m.note}) vel:\${m.vel}</span>\`;
      case 'note_off': return \`\${ts}<span class="msg-note" style="color:#60a5fa;opacity:0.8;">◼ Note Off Ch\${m.ch+1} \${noteName(m.note)} (\${m.note})</span>\`;
      case 'cc':       return \`\${ts}<span class="msg-cc" style="color:#10b981;">◈ CC \${hexV(m.cc)} = \${hexV(m.val)}  Ch\${m.ch+1}</span>\`;
      case 'pc':       return \`\${ts}<span class="msg-pc" style="color:#a855f7;">⬡ PC \${m.pc}  Ch\${m.ch+1}</span>\`;
      case 'panic':    return \`\${ts}<span style="color:#ef4444;font-weight:bold;">🚨 \${m.message}</span>\`;
      case 'sysex':    return \`\${ts}<span class="msg-sysex" style="color:#eab308;">⚡ SysEx [\${m.bytes.length}B] \${m.bytes.map(b=>b.toString(16).toUpperCase().padStart(2,'0')).join(' ')}</span>\`;
      default:         return \`\${ts}<span style="color:var(--text3)">\${(m.raw||[]).map(b=>b.toString(16).toUpperCase()).join(' ')}</span>\`;
    }`;

code = code.replace(regex, replacement);
fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('patched monitor colors');
