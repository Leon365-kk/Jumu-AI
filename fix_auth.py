import fileinput
f = fileinput.input('C:/Users/STEMLENS/Music/Jumu AI/frontend/src/lib/AuthContext.tsx', inplace=True)
for line in f:
    print(line.replace('redirectTo: window.location.origin', 'redirectTo: window.location.origin + " /onboarding/basic-questions\'), end='')
