M0
G17 G21 G90 G94 G54
G0 X-5 Y0 Z0 F200
G2 X0 Y5 I5 J0 F200
G02 X5 Y0 I0 J-5
G02 X0 Y-5 I-5 J0
G02 X-5 Y0 I0 J5
G01 Z1 F500
G00 X0 Y0 Z5
G00 X10 Y0 Z5
G00 Y10 Z5
M0 ;This is a comment on the M0 line
G00 X10 Y0 Z5
M0 (This is a bracket comment)
G00 Y10 Z5