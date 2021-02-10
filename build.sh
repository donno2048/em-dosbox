cp ../c.img ./src/win
cp ../622c.img ./src/win
git clone https://github.com/emscripten-core/emsdk
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
cp .emscripten ~
export PATH="/usr/bin:$PATH"
cd ..
sudo autoreconf -f -i
./autogen.sh
emconfigure ./configure --enable-wasm --disable-opengl --host=none-none-none AR=/usr/bin/ar && emmake make && {
cd src
python packager.py win95 win AUTOEXEC.BAT
sed -i -e 's/(simulateInfiniteLoop)/(false)/g' dosbox.js
}
