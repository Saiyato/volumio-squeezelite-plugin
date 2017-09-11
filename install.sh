## LMS installation script
echo "Installing Squeezelite and its dependencies..."
INSTALLING="/home/volumio/squeezelite-plugin.installing"

if [ ! -f $INSTALLING ]; then

	touch $INSTALLING

	if [ ! -d /data/plugins/music_services/squeezelite ];
	then 
		# Download latest squeezelite executable
		echo "Downloading squeezelite..."
		mkdir /home/volumio/logitechmediaserver
		wget -O /opt/squeezelite http://ralph_irving.users.sourceforge.net/pico/squeezelite-armv6hf-noffmpeg
				
		# Fix executable rights
		chown volumio:volumio /opt/squeezelite
		chmod 755 /opt/squeezelite
		
		# Download and activate default unit
		wget -O /etc/systemd/system/squeezelite.service https://raw.githubusercontent.com/Saiyato/volumio-squeezelite-plugin/master/unit/squeezelite.service
		
		sed -i s|${SERVER}||g /etc/systemd/system/squeezelite.service
		sed -i s|${NAME}|Volumio|g /etc/systemd/system/squeezelite.service
		sed -i s|${OUTPUT_DEVICE}|-o default|g /etc/systemd/system/squeezelite.service
		sed -i s|${ALSA_PARAMS}|-a 80:4::|g /etc/systemd/system/squeezelite.service
		sed -i s|${EXTRA_PARAMS}||g /etc/systemd/system/squeezelite.service
		
		systemctl daemon-reload
		
	else
		echo "Plugin already exists, not continuing."
	fi
	
	rm $INSTALLING

	#required to end the plugin install
	echo "plugininstallend"
else
	echo "Plugin is already installing! Not continuing..."
fi
