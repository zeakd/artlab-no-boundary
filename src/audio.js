import io from 'socket.io-client'
// const audio = new Audio('1.1도.wav');
// audio.play();



const audioStates = [
  {
    files: ['1.1도.wav'],
    audio: null,
  },
  // {
  //   files: ['1.5도 샾.wav'],
  //   audio: null,
  // },
  {
    files: ['2.1레.wav'],
    audio: null,
  },
  // {
  //   files: ['2.5레샾.wav'],
  //   audio: null,
  // },
  {
    files: ['3.미.wav'],
    audio: null,
  },
  {
    files: ['4.1파.wav'],
    audio: null,
  },
  {
    files: ['8.1도.wav'],
    audio: null,
  },
  {
    files: ['7.시.wav'],
    audio: null,
  },
  {
    files: ['6.1라.wav'],
    audio: null,
  },
  
  // {
  //   files: ['4.5 파샾.wav'],
  //   audio: null,
  // },
  {
    files: ['5.1솔.wav'],
    audio: null,
  },
  
  // {
    //   files: ['5.5솔샾.wav'],
    //   audio: null,
    // },


  {
    files: ['9.1레.wav'],
    audio: null,
  },
  {
    files: ['10.미.wav'],
    audio: null,
  },
  {
    files: ['11.1파.wav'],
    audio: null,
  },
  {
    files: ['12.1솔.wav'],
    audio: null,
  },
  {
    files: ['13.라.wav'],
    audio: null,
  },
  {
    files: ['14.1시.wav'],
    audio: null,
  },
  {
    files: ['15.도.wav'],
    audio: null,
  },
  {
    files: ['15.도.wav'],
    audio: null,
  },
 
]

const socket = io('http://localhost:4000');
socket.on('connect', () => {
  console.log('connect!')
});

socket.on('imageData', (values)=> {
  updateSound(values);
})

function updateSound(values) {
  console.log(values);
  values.forEach((value, index) => {
    let volume = value / 100000 + 0.3;
    volume = volume > 1 ? 1 : volume;

    if (value < 5000) {
      audioStates[index].audio = null;
    } else {
      if (!audioStates[index].audio) {
        audioStates[index].audio = new Audio(audioStates[index].files[0]);
        audioStates[index].audio.volume = volume;
        audioStates[index].audio.play();
      } else {
        audioStates[index].audio.volume = volume;
      }

    }
  })
}