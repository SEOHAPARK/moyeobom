import mark from '../assets/logo/mark.svg'

export default function Logo({ size = 28, className = '' }) {
  return <img src={mark} alt="모여봄 마크" width={size} height={size} className={className} />
}
