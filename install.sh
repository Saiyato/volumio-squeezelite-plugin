## LMS installation script
echo "Installing Squeezelite and its dependencies..."
INSTALLING="/home/volumio/squeezelite-plugin.installing"

if [ ! -f $INSTALLING ]; then

	touch $INSTALLING

	apt-get update
	
	# Download latest squeezelite executable
	echo "Downloading squeezelite..."
	mkdir /home/volumio/logitechmediaserver
	wget -O /usr/bin/squeezelite http://ralph_irving.users.sourceforge.net/pico/squeezelite-armv6hf-noffmpeg
	
	# Add the systemd unit
	echo "Adding the systemd unit"
	rm /etc/systemd/system/squeezelite.service
	wget -O /etc/systemd/system/logitechmediaserver.service https://raw.githubusercontent.com/Saiyato/volumio-squeezelite-plugin/master/unit/squeezelite.service
	
	rm $INSTALLING

	#required to end the plugin install
	echo "plugininstallend"
else
	echo "Plugin is already installing! Not continuing..."
fi
