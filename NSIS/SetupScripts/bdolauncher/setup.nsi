# ====================== 自定义宏 产品信息==============================
!define PRODUCT_NAME           		"BDO Launcher"
!define PRODUCT_PATHNAME           	"BDO Launcher"      #安装卸载项用到的KEY
!define INSTALL_APPEND_PATH         "BDO Launcher"      #安装路径追加的名称 
!define INSTALL_DEFALT_SETUPPATH    ""          #默认生成的安装路径 
!define EXE_NAME               		"BDO Launcher.exe"
!define PRODUCT_VERSION        		"1.0.1.0"
!define PRODUCT_PUBLISHER      		"Powered by CaNplay"
!define PRODUCT_LEGAL          		"Copyright (C) 2019 CaNplay"
!define INSTALL_OUTPUT_NAME    		"BDO_Launcher_1.0.1.exe"

# ====================== 自定义宏 安装信息==============================
!define INSTALL_7Z_PATH 	   		"..\app.7z"
!define INSTALL_7Z_NAME 	   		"app.7z"
!define INSTALL_RES_PATH       		"skin.zip"
!define INSTALL_LICENCE_FILENAME    "license.txt"
!define INSTALL_ICO 			    "logo.ico"


!include "ui.nsh"

# ==================== NSIS属性 ================================

# 针对Vista和win7 的UAC进行权限请求.
# RequestExecutionLevel none|user|highest|admin
RequestExecutionLevel admin

#SetCompressor zlib

; 安装包名字.
Name "${PRODUCT_NAME}"

# 安装程序文件名.

OutFile "..\..\Output\${INSTALL_OUTPUT_NAME}"

InstallDir "1"

# 安装和卸载程序图标
Icon              "${INSTALL_ICO}"
UninstallIcon     "uninst.ico"
