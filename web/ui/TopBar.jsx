import '../css/TopBar.css'

const TopBar = () => {
  return (
    <div className='top-bar'>
      <h3 className='top-bar-title'>Untitled chat</h3>
      <button
        className='button-clear top-bar-button'
        onClick={() => {}}
        ariaLabel='Clear chat'
      >
        <i className='fa fa-trash-o fa-2x'></i>
      </button>
    </div>
  )
}

export default TopBar

