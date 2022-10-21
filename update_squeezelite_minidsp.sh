# updates available squeezelite 1.1.1
url="https://github.com/itskaefer/volumio-squeezelite-plugin/raw/master/volumio-squeezelite-plugin.zip"
pluginPath="/data/plugins/music_service"

# check if plugin already installed
if [ -d $pluginPath/squeezelite ]; then
  echo "Downloading squeezelite-plugin ..."
  wget -q -O /tmp/squeezelite.zip $url
  mkdir /tmp/squeezelite
  echo "Unzip plugin ..."
  miniunzip -d /tmp/squeezelite /tmp/squeezelite.zip
  echo "Copy plugin files to data ..."
  cp -r /tmp/squeezelite $pluginPath
  echo "Add special config for minidsp ..."
  cp $pluginPath/squeezelite/config_minidsp.json $pluginPath/squeezelite/config.json
  sed -i 's/self.commandRouter.volumioToggle();/self.commandRouter.volumioToggle();\nthis.commandRouter.executeOnPlugin('music_service', 'squeezelite', 'pause');/g' /volumio/app/plugins/music_service/inputs/index.js
  sed -i 's/self.commandRouter.volumioPrevious();/self.commandRouter.volumioPrevious();\nthis.commandRouter.executeOnPlugin('music_service', 'squeezelite', 'previousSong');/g' /volumio/app/plugins/music_service/inputs/index.js
  sed -i 's/self.commandRouter.volumioNext();/self.commandRouter.volumioNext();\nthis.commandRouter.executeOnPlugin('music_service', 'squeezelite', 'nextSong');/g' /volumio/app/plugins/music_service/inputs/index.js
  echo "Fix permissions ..."
  chown -R volumio:volumio $pluginPath/squeezelite
  echo "Cleanup ..."
  rm -r /tmp/squeezelite
  rm /tmp/squeezelite.zip
else
  echo "Please first install squeezelite plugin via webinterface."
fi
