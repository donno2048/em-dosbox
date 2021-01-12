cp ../c.img ./src/win
cp ../622c.img ./src/win
git clone https://github.com/emscripten-core/emsdk
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
cp .emscripten ~
export PATH=$PWD:$PATH
cd ..
sudo autoreconf -f -i
./autogen.sh
emconfigure ./configure --enable-wasm --disable-opengl --host=none-none-none
make
cd src
python packager.py win95 win AUTOEXEC.BAT
