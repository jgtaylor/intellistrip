# intellistrip
##A smart powerstrip management

This strip uses a raspberry pi or beagle bone black (or another thing that has GPIOs via SYSFS).
It controls one or more relays connected to standard plugs.
It monitors temperature, humidity, light, and just about anything else.

depending on what it's monitoring, it can turn things on and off.

##GOALS

the goal is to use it for winter gardens, green houses or other automation projects.

###THINGS TO NOTE:
 this will eventually work on (hopefully) all ARM architecture
 systems. That includes Beagle Bone Black, probably an Arduino YUN [but I don't
 have one], and the Raspberry Pi, along with others.

 Because of this, things get interesting ... I've looked into beagle bone Black
 device tree overlays so that you can change a pin mux to general GPIO or
 whatever (SPI/i2c/HDMI/...). The Raspberry Pi is less forthcoming [or I haven't
 researched it enough] - that is to say, I don't know how to pin mux on RasPi.

 Anyway, all this is to say that right now, this only works for a RasPi 2.
 and is pretty debian based (kernel 3.18.7-v7+ Rasbian)
