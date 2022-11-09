## Squeezelite installation script
echo "Installing Squeezelite and its dependencies..."
INSTALLING="/home/volumio/squeezelite-plugin.installing"

if [ ! -f $INSTALLING ]; then
	/bin/touch $INSTALLING

	if [ ! -d /opt/squeezelite ]; then
		dist=$(cat /etc/os-release | grep '^VERSION=' | cut -d '(' -f2 | tr -d ')"')
		arch=$(arch)
    variant=$(cat /etc/os-release | grep '^VOLUMIO_VARIANT=' | cut -d '=' -f2 | tr -d '"')

    if [ $dist = "jessie" ] && [ $variant = "minidspshd" ] && ( [ $arch = "armv6l" ] || [ $arch = "armv7l" ] || [ $arch = "aarch64" ] ); then
      echo "Using squeezelite 1.9.9 armel static architecture (detected minidsp SHD)"
      ln -fs /data/plugins/music_service/squeezelite/known_working_versions/jessie/squeezelite-arm-minidspshd /opt/squeezelite
    elif [ $dist = "jessie" ] && ( [ $arch = "armv6l" ] || [ $arch = "armv7l" ] || [ $arch = "aarch64" ] ); then
      echo "Using squeezelite 1.8.7 for compatibility reasons (detected Debian Jessie)"
			ln -fs /data/plugins/music_service/squeezelite/known_working_versions/jessie/squeezelite-armv6hf-volumio /opt/squeezelite
		elif [ $dist = "buster" ] && ( [ $arch = "armv6l" ] || [ $arch = "armv7l" ] ); then
			echo "Using squeezelite 1.9.9 for armhf architecture"
			ln -fs /data/plugins/music_service/squeezelite/known_working_versions/squeezelite-1.9.9.1392-armhf /opt/squeezelite
		elif [ $dist = "buster" ] && ( [ $arch = "aarch64" ] ); then
			echo "Using squeezelite 1.9.9 for aarch64 architecture"
			ln -fs /data/plugins/music_service/squeezelite/known_working_versions/squeezelite-1.9.9.1392-aarch64 /opt/squeezelite
		elif [ $dist = "buster" ] && ( [ $arch = "x86_64" ] ); then
			echo "Using squeezelite 1.9.9 for x86_64 architecture"
			ln -fs /data/plugins/music_service/squeezelite/known_working_versions/squeezelite-1.9.9.1392-x86_64 /opt/squeezelite
		elif [ $dist = "buster" ] && ( [ $arch = "i686" ] ); then
			echo "Using squeezelite 1.9.9 for i686 architecture"
			ln -fs /data/plugins/music_service/squeezelite/known_working_versions/squeezelite-1.9.9.1392-i686 /opt/squeezelite
		fi

    # Fix executable rights
		chown volumio:volumio /opt/squeezelite
		chmod 755 /opt/squeezelite
		
		# activate default unit
		TMPUNIT="/data/plugins/music_service/squeezelite/unit/squeezelite.service"
		chown volumio $TMPUNIT

		sed 's|${NAME}|-n Volumio|g' -i $TMPUNIT
		sed 's|${OUTPUT_DEVICE}|-o default|g' -i $TMPUNIT
		sed 's|${ALSA_PARAMS}|-a 80:4::|g' -i $TMPUNIT
    sed 's|${SERVER_PARAMS}|-s 127.0.0.1|g' -i $TMPUNIT
    # sed 's|${EXTRA_PARAMS}||g' -i $TMPUNIT  - moved down

    if [ $variant = "minidspshd" ]; then
      pluginPath="/data/plugins/music_service"
      pluginInputs="/volumio/app/plugins/music_service/inputs/index.js"
      echo "Add special config for minidsp ..."
      cp $pluginPath/squeezelite/config_minidsp.json $pluginPath/squeezelite/config.json
      if [ $(grep -c "squeezelite" $pluginInputs ) -eq 0 ]; then
        sed -i "s/self.commandRouter.volumioToggle();/self.commandRouter.volumioToggle();\nthis.commandRouter.executeOnPlugin('music_service', 'squeezelite', 'pause');/g" $pluginInputs
        sed -i "s/self.commandRouter.volumioPrevious();/self.commandRouter.volumioPrevious();\nthis.commandRouter.executeOnPlugin('music_service', 'squeezelite', 'previousSong');/g" $pluginInputs
        sed -i "s/self.commandRouter.volumioNext();/self.commandRouter.volumioNext();\nthis.commandRouter.executeOnPlugin('music_service', 'squeezelite', 'nextSong');/g" $pluginInputs
      else
        echo "Plugin inputs already updated ..."
      fi
      echo "Fix permissions ..."
      chown -R volumio:volumio $pluginPath/squeezelite
      sed 's|${EXTRA_PARAMS}|-r 44100-196000 -R vE:::24|g' -i $TMPUNIT
    else
      sed 's|${EXTRA_PARAMS}||g' -i $TMPUNIT
    fi
		
		#mv $TMPUNIT /etc/systemd/system/squeezelite.service
		ln -fs /data/plugins/music_service/squeezelite/unit/squeezelite.service /etc/systemd/system/squeezelite.service
		systemctl daemon-reload
		
	else
		echo "Plugin already exists, not continuing."
	fi
	
	rm $INSTALLING

	# Required to end the plugin install
	echo "plugininstallend"
else
	echo "Plugin is already installing! Not continuing..."
fi
