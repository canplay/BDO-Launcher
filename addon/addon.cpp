#include <napi.h>
#include <windows.h>
#include <thread>
#include <shellapi.h>
#include <shlobj.h>
#include <iostream>
#include <fstream>
#include <TlHelp32.h>

bool CreateLinkFile(LPCSTR szStartAppPath, LPCSTR szAddCmdLine, LPCOLESTR szDestLnkPath, LPCSTR szIconPath)
{
	HRESULT hr = CoInitialize(NULL);
	if (SUCCEEDED(hr))
	{
		IShellLink *pShellLink;
		hr = CoCreateInstance(CLSID_ShellLink, NULL, CLSCTX_INPROC_SERVER, IID_IShellLink, (void **)&pShellLink);
		if (SUCCEEDED(hr))
		{
			pShellLink->SetPath(szStartAppPath);
			std::string strTmp = szStartAppPath;
			int nStart = strTmp.find_last_of(TEXT("/\\"));
			pShellLink->SetWorkingDirectory(strTmp.substr(0, nStart).c_str());
			pShellLink->SetArguments(szAddCmdLine);

			if (szIconPath)
				pShellLink->SetIconLocation(szIconPath, 0);

			IPersistFile *pPersistFile;
			hr = pShellLink->QueryInterface(IID_IPersistFile, (void **)&pPersistFile);
			if (SUCCEEDED(hr))
			{
				hr = pPersistFile->Save((szDestLnkPath), FALSE);
				if (SUCCEEDED(hr))
					return true;
				pPersistFile->Release();
			}
			pShellLink->Release();
		}
		CoUninitialize();
	}
	return false;
}

Napi::Value CheckAutoStart(const Napi::CallbackInfo &info)
{
	std::fstream _file;
	_file.open("C:/ProgramData/Microsoft/Windows/Start Menu/Programs/StartUp/文山城投信息化办公平台.lnk", std::ios::in);
	if (_file)
		return Napi::Boolean::New(info.Env(), true);
	else
		return Napi::Boolean::New(info.Env(), false);
}

Napi::Value SwitchAutoStart(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	if (info.Length() < 1)
	{
		Napi::TypeError::New(env, "参数数量错误").ThrowAsJavaScriptException();
		return env.Null();
	}

	if (!info[0].IsString())
	{
		Napi::TypeError::New(env, "参数类型错误").ThrowAsJavaScriptException();
		return env.Null();
	}

	std::fstream _file;
	_file.open("C:/ProgramData/Microsoft/Windows/Start Menu/Programs/StartUp/文山城投信息化办公平台.lnk", std::ios::in);
	if (_file)
	{
		if (DeleteFile("C:/ProgramData/Microsoft/Windows/Start Menu/Programs/StartUp/文山城投信息化办公平台.lnk"))
			return Napi::Boolean::New(info.Env(), true);
	}
	else
	{
		std::string arg0 = info[0].As<Napi::String>().Utf8Value();
		if (CreateLinkFile(arg0.c_str(), "", L"C:/ProgramData/Microsoft/Windows/Start Menu/Programs/StartUp/文山城投信息化办公平台.lnk", 0))
			return Napi::Boolean::New(info.Env(), true);
	}
	return Napi::Boolean::New(info.Env(), false);
}

Napi::Value InjectMemory(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();

	HANDLE hShot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
	if (hShot != INVALID_HANDLE_VALUE)
	{
		PROCESSENTRY32 process;
		process.dwSize = sizeof(process);

		BOOL ret = Process32First(hShot, &process);
		while (ret)
		{
			if (!wcscmp(process.szExeFile, L"BlackDesert64.exe"))
			{
				CloseHandle(hShot);

				hShot = CreateToolhelp32Snapshot(TH32CS_SNAPMODULE, process.th32ProcessID);
				if (hShot != INVALID_HANDLE_VALUE)
				{
					MODULEENTRY32 module;
					module.dwSize = sizeof(module);

					ret = Module32First(hShot, &module);
					while (ret)
					{
						if (!wcscmp(module.szModule, L"BlackDesert64.exe"))
						{
							CloseHandle(hShot);

							HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, FALSE, module.th32ProcessID);
							if (hProcess)
							{
								DWORD64 dwBaseAddr;
								SIZE_T size;
								if (ReadProcessMemory(hProcess, (LPVOID)module.modBaseAddr, &dwBaseAddr, sizeof(DWORD64), &size))
								{
									wchar_t tmp[MAX_PATH];
									swprintf_s(tmp, L"0x%08x", (DWORD)dwBaseAddr);
									dwBaseAddr = (DWORD64)_wtoi(tmp);

									DWORD64 pbuffer;
									if (ReadProcessMemory(hProcess, (LPVOID)(dwBaseAddr + (DWORD64)0x00144144), &pbuffer, sizeof(DWORD64), &size))
									{
										swprintf_s(tmp, L"值: %d", (DWORD)pbuffer);
										std::wcout << tmp << std::endl;

										// BYTE *pByte = new BYTE[4];
										// int n = 1000;
										// pByte[0] = (BYTE)(100 & 0xFF);
										// for (int i = 0; i < 4; i++)
										// 	pByte[i] = (BYTE)(1000 >> (8 * i) & 0xff);
										BYTE byte[] = { 0x90, 0x90 };
										WriteProcessMemory(hProcess, (LPVOID)(dwBaseAddr + (DWORD64)0x014F5030), byte, sizeof(byte), &size);
									}

									if (ReadProcessMemory(hProcess, (LPVOID)(dwBaseAddr + (DWORD64)0x00144144), &pbuffer, sizeof(DWORD64), &size))
									{
										BYTE byte[] = { 0x90, 0x90 };
										WriteProcessMemory(hProcess, (LPVOID)(dwBaseAddr + (DWORD64)0x014F5030), byte, sizeof(byte), &size);
									}

									if (ReadProcessMemory(hProcess, (LPVOID)(dwBaseAddr + (DWORD64)0x00144144), &pbuffer, sizeof(DWORD64), &size))
									{
										BYTE byte[] = { 0xEB };
										WriteProcessMemory(hProcess, (LPVOID)(dwBaseAddr + (DWORD64)0x014F5030), byte, sizeof(byte), &size);
									}

									if (ReadProcessMemory(hProcess, (LPVOID)(dwBaseAddr + (DWORD64)0x00144144), &pbuffer, sizeof(DWORD64), &size))
									{
										BYTE byte[] = { 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF };
										WriteProcessMemory(hProcess, (LPVOID)(dwBaseAddr + (DWORD64)0x014F5030), byte, sizeof(byte), &size);
									}

									if (ReadProcessMemory(hProcess, (LPVOID)(dwBaseAddr + (DWORD64)0x00144144), &pbuffer, sizeof(DWORD64), &size))
									{
										std::string str = info[0].As<Napi::String>().Utf8Value();
										BYTE* byte = (BYTE*)str.c_str();
										WriteProcessMemory(hProcess, (LPVOID)(dwBaseAddr + (DWORD64)0x014F5030), byte, str.length, &size);
									}
								}

								CloseHandle(hProcess);
							}

							break;
						}

						ret = Module32Next(hShot, &module);
					}
				}

				break;
			}

			ret = Process32Next(hShot, &process);
		}
	}

	return Napi::Boolean::New(info.Env(), true);
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
	exports.Set(Napi::String::New(env, "CheckAutoStart"), Napi::Function::New(env, CheckAutoStart));
	exports.Set(Napi::String::New(env, "SwitchAutoStart"), Napi::Function::New(env, SwitchAutoStart));
	exports.Set(Napi::String::New(env, "InjectMemory"), Napi::Function::New(env, InjectMemory));
	return exports;
}

NODE_API_MODULE(addon, Init)