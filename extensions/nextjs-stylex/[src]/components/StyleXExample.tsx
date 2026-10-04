import * as stylex from '@stylexjs/stylex';
import { tokens } from '../theme/tokens.stylex';

const styles = stylex.create({
  container: {
    padding: '2rem',
    backgroundColor: tokens.background,
    borderRadius: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: tokens.primary,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    color: tokens.primary,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  text: {
    color: tokens.text,
    fontSize: '1rem',
  }
});

export function StyleXExample() {
  return (
    <div {...stylex.props(styles.container)}>
      <h2 {...stylex.props(styles.title)}>StyleX inside Next.js</h2>
      <p {...stylex.props(styles.text)}>
        This component is styled using StyleX with typed theme tokens.
      </p>
    </div>
  );
}
