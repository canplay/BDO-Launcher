# BDO-Launcher

![Image text](https://github.com/canplay/BDO-Launcher/blob/master/preview.png)

Requirement:

- Visual C++ 2019
- Node.js
- BDO-Backend (<https://github.com/canplay/BDO-Backend>)
- (option) Use the UILib library for NSIS (<https://github.com/canplay/NSIS>)

Dev:

1. command: npm i
2. compile the "./Permission" project with Visual C++ 2019
3. launcher BDO-Backend
4. modify and copy "./config.json" to ".quasar/electron" directory
5. copy "./lang.json" to ".quasar/electron" directory
6. copy "./Permission/output/Permission.exe" and "./aria2" directory to ".quasar/electron" directory
7. command: quasar dev -m electron

Dist:

1. follow steps Dev 1-3
2. command: quasar build --mode electron --publish always
3. using the "Enigma Virtual Box (<https://enigmaprotector.com/)"> to open "./evb.evb", configure "Enigma Virtual Box" and package the "./dist/electron/Packaged/win-unpacked/resource" directory, click Process to generate something like "BDO Launcher_boxed.exe"
4. copy "./dist/electron/Packaged/win-unpacked" directory and "BDO Launcher_boxed.exe" to "./Bin" directory, delete "./Bin/resources/electron.asar" and "./Bin/resources/app" directory
5. copy "./Permission/output/Permission.exe" and "./aria2" directory to "./Bin/resources/app"
6. modify and copy "./config.json" to "./Bin/resources/app" directory
7. copy "./lang.json" to "./Bin/resources/app" directory
8. (option) modify "./NSIS/setup.nsi" and "./NSIS/ui.nsi"
9. (option) copy "./Bin/\*.\*" to the NSIS directory "./FilesToInstall" directory
10. (option) copy "./NSIS/\*.\*" to the NSIS directory
11. (option) run "build-bdolauncher.bat" in NSIS directory "./Output" to generate the installation package
