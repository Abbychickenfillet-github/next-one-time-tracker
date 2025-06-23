import styles from './loader.module.css'

// https://css-loaders.com/spinner/
export default function CssLoader({
  size = 50,
  width = 8,
  color = '#25b09b',
  extraStyles = {},
}) {
  return (
    <>
      <div
        style={{
          '--size': `${size}px`,
          '--color': color,
          '--width': `${width}px`,
          ...extraStyles,
        }}
        className={styles.loader}
      ></div>
    </>
  )
}
