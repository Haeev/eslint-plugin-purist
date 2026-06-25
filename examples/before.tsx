// Before: patterns this plugin discourages
export function handleClick() {
  console.log('clicked')
}

export function Card() {
  if (isReady) {
    loadData()
    renderSkeleton()
    attachListeners()
  }
}

const Panel = () => (
  <div
    className={isActive ? 'border-primary' : 'border-muted'}
    style={{ color: 'red' }}
    onClick={click}
  />
)
