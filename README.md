# BDO-Launcher

![Image text](https://github.com/canplay/BDO-Launcher/blob/master/preview.png)

WIP

Build:
1. npm i
2. npm run build64
3. quasar dev -m electron

Dist:
1. npm i
2. npm run build64
3. modify Index.vue line 187 to request url
4. quasar build --mode electron --publish always
5. using the Enigma Virtual Box (https://enigmaprotector.com/) to open the root directory of evb.evb, select the correct path and click Process
6. copy ./dist/electron/Packaged/win-ia32-unpacked/*.* and BDO Launcher_boxed.exe to ./Bin, delete ./Bin/resources/electron.asar and ./Bin/resources/app/*.*
7. copy ./aria2 and ./config.json to ./Bin/resources/app
8. modify ./launcher.json and copy to server