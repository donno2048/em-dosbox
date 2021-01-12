sudo apt-get update
yes | sudo apt-get install python python3 git binutils cmake automake
git clone https://github.com/donno2048/em-dosbox
cp c.img em-dosbox/src/win
cp 622c.img em-dosbox/src/win
git clone https://github.com/emscripten-core/emsdk
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
cp .emscripten ~
export PATH=$PWD:$PATH
cd ../em-dosbox
sudo autoreconf -f -i
./autogen.sh
emconfigure ./configure --enable-wasm --disable-opengl --host=none-none-none
make
cd src
python packager.py win95 win AUTOEXEC.BAT
