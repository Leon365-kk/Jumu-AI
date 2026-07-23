const fs = require('fs');
const path = 'C:/Users/STEMLENS/Music/Jumu AI/frontend/src/lib/AuthContext.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace('redirectTo: window.location.origin', 'redirectTo: window.location.origin + " /onboarding/basic-questions\');
fs.writeFileSync(path, content);
console.log('AuthContext updated');
