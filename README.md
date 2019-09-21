# BDO-Launcher

![Image text](https://github.com/canplay/BDO-Launcher/blob/master/preview.png)

WIP

Dev:

1. npm i
2. compile the "./Permission" project with Visual C++ 2019
3. modify "./launcher.json" and copy to server
4. modify "./config.json"
5. copy "./Permission/output/Permission.exe" and "./aria2" directory to ".quasar/electron" directory
6. quasar dev -m electron

Dist:

1. follow steps Dev 1-4
2. quasar build --mode electron --publish always
3. using the "Enigma Virtual Box (<https://enigmaprotector.com/)"> to open "./evb.evb", configure "Enigma Virtual Box" and package the "./dist/electron/Packaged/win-unpacked/resource" directory, click Process to generate something like "BDO Launcher_boxed.exe"
4. copy "./dist/electron/Packaged/win-unpacked/*.*" and "BDO Launcher_boxed.exe" to "./Bin", delete "./Bin/resources/electron.asar" and "./Bin/resources/app/*.*"
5. copy "./Permission/output/Permission.exe", "./config.json" and "./aria2" directory to "./Bin/resources/app"
6. (option) modify "./NSIS" and use NSIS to package the installer
