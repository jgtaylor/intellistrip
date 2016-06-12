# intellistrip
##A smart powerstrip management
The intellistrip idea has grown to a full automation stack. But, that's going to built out in another project. For now, we've got to get a resonable thing going via a web interface. To that end, everything will use javascript and stuff like that.

###javascript instead of ksh?
well, the ksh will stay, because hey - if it ain't broke don't fix it. But the ksh doesn't do a full web interface all biz-bang jizzy jam, the way JS and her friends do. So, it's time for me to enter the modern world.

###Full Web Stack
The world longs for dashboards, graphs and pretty pictures (as well as kittens). So, nodejs with express.js, mongoose.js, later.js (our scheduler), and bonescript will give us the backend, while Bootstrap, Angular.js & D3.js as well as a few other helper libraries will give us the front end. Of course, being part of the Internet of Things (IoT), we'll have a MongoDB database for historical data analysis & configuration storage, MQTT for pub/sub data access & integration, as well as real-time stats updates.

##Hardware
###A Beagle Bone Black
I'm working on a final design for some hardware - a BBB cape - that will have everything needed for an envrionmental control system, plus some things not needed. To date, several PWM to 0-10v control chips (for dimming modern fans, leds, or other tech hi-jacked from the Building Control folks), a Relay control input, inputs for temp/rh sensors, light intensity sensors, and well, just sensors in general.

####Default component hardware
The default hardware apart from the Beagle Bone, are things like the DS18B20 water proof temperature sensor, the DHT22 temp & RH sensor, TC4427 Mosfet Gate Drivers for 0-10v PWM controls (EC Fans, LEDs, motors, etc.), among others. I've got an ugly prototype shield that will basicly be "supported". More support will come through updates, etc. There's also a project underway to provide a nodejs "device manager" kind of thing that can be used. This will facilitate more components all working together. 

###Rasberry Pi
Also a nifty little beast. However, I've set my sights on the BBB (which might have been a bad idea, but it has _all_ the stuff for the stuff we need. If you're going to use an R-Pi, you'll have to get some PWM generators (or a DAC w/ an op-amp), an Analog-Digital-Converter chip, etc. Also, depending on what version of the Pi you're using, you might even have to get an I/O port expander of some sort. The newer Pi2 and Pi3 should have enough pins for an 8 port power switch, as well as for the sensors.

###Other Linux based ARM boards
There's a lot of movement in the ARM computing world right now and things like the BananaPi, pcDuino, intel Edison and others are available with an OS on top. There's no reason (technically speaking) that this shouldn't work with them. My only reasons are: cash flow (they get expensive after a while), and effort. Most of this should just work on any linux implementation with whatever library access to the device layer. For example, currently, the dht22 sensor is accessed via Adafruit's python drivers which work for both pi and bbb. Intellistrip just calls the script which outputs a JSON object. 

##GOALS

the goal is to use it for winter gardens, green houses, aquariums, beer/wine brewing, or other automation projects.
#### aditional requirements
It requires ksh, which you can install via _apt-get install ksh_.

