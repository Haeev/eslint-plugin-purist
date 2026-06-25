// After: patterns encouraged by purist/recommended
const handleClick = () => {
  console.log('clicked')
}

const Card = () => {
  if (!isReady) {
    return
  }

  loadData()
  renderSkeleton()
  attachListeners()
}

const Panel = () => (
  <div
    className={cn('border-muted', isActive && 'border-primary')}
    onClick={handleClick}
    onKeyDown={handleKeyDown}
    tabIndex={0}
    role="button"
    aria-label="Open panel"
  />
)
