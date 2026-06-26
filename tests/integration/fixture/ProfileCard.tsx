import { cn } from 'clsx'

function loadUser() {
  if (ready) {
    a()
    b()
    c()
  }
}

const save = () => {}

export const ProfileCard = () => (
  <section>
    <div className={isActive ? 'border-primary' : 'border-muted'} style={{ color: 'red' }}>
      <div onClick={save}>Save profile</div>
    </div>
  </section>
)
