# volumio-squeezelite-plugin
Volumio plugin to install and configure a Squeezelite client

Not much to say about it, it's pretty straight forward.

It starts with default values:

-o default -n Volumio -a 80:4::


# changed by itskaefer
Added updates so it'll work on a miniDSP SHD with the NEO3 board.
It should also enable you to use the remote control for next,previous,pause,play

-o default
-n minidsp-shd
-a 80:4::
-s 127.0.0.1
-r 44100-192000 -R vE:::24


INSTALL on miniDSP SHD
1. install the available squeezelite-plugin on volumio (don't activate it)

2. log into miniDSP SHD by SSH and execute the following command:

wget -O - https://github.com/itskaefer/volumio-squeezelite-plugin/raw/master/update_squeezelite_minidsp.sh | sudo sh

3. go to the "installed plugins" in volumio and activate the plugin.
   click "Settings" and change the IP to your LMS, save the configuration and squeezelite should start

