const { exec } = require('child_process')
const execPromise = require('util').promisify(exec)

/* MAC PLAY COMMAND */
const macPlayCommand = (path, volume) => `afplay \"${path}\" -v ${volume}`

/* WINDOW PLAY COMMANDS */
const createMediaPlayer = path => `$player = New-Object Media.SoundPlayer "${path}";`
const playAudio = `$player.PlaySync();`
const stopAudio = `Exit;`

const windowPlayCommand = (path, volume) =>
  `powershell -c ${createMediaPlayer(path,)} ${playAudio} ${stopAudio}`

/* LINUX PLAY COMMAND */
const linuxPlayCommand = (path, volume) =>  `play \"${path}\" vol ${volume}`

module.exports = {
  play: async (path, volume=0.5) => {
    /**
     * Window: mediaplayer's volume is from 0 to 1, default is 0.5
     * Mac: afplay's volume is from 0 to 255, default is 1. However, volume > 2 usually result in distortion.
     * Therefore, it is better to limit the volume on Mac, and set a common scale of 0 to 1 for simplicity
     */
    const volumeAdjustedByOS = (process.platform === 'darwin' || process.platform == 'linux') ? Math.min(2, volume * 2) : volume

    const playCommand =
      process.platform === 'linux' ? linuxPlayCommand(path, volumeAdjustedByOS) : (process.platform === 'darwin' ? macPlayCommand(path, volumeAdjustedByOS) : windowPlayCommand(path, volumeAdjustedByOS))
    try {
      return await execPromise(playCommand, {windowsHide: true});
    } catch (err) {
      throw err
    }
  },
}
