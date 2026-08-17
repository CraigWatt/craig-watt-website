const React = require('react');

function renderChildren(children, extras = []) {
  return [...extras.filter(Boolean), children].filter(Boolean);
}

function createWrapper(defaultTag = 'div') {
  return React.forwardRef(function MockHeroUIComponent(props, ref) {
    const {
      as,
      children,
      startContent,
      endContent,
      onPress,
      isDisabled,
      isRequired,
      ...rest
    } = props;
    const Tag = typeof as === 'string' ? as : defaultTag;

    return React.createElement(
      Tag,
      {
        ref,
        ...rest,
        disabled: isDisabled,
        required: isRequired,
        onClick: rest.onClick ?? onPress,
      },
      renderChildren(children, [startContent, endContent])
    );
  });
}

const Button = createWrapper('button');
const Card = createWrapper('div');
const CardBody = createWrapper('div');
const CardHeader = createWrapper('div');
const Chip = createWrapper('span');
const Snippet = createWrapper('code');
const Breadcrumbs = createWrapper('nav');
const BreadcrumbItem = createWrapper('span');
const Form = createWrapper('form');

const HeroUIProvider = ({ children }) => React.createElement(React.Fragment, null, children);

const Alert = ({ title, description, children, ...rest }) =>
  React.createElement(
    'div',
    rest,
    renderChildren(children, [
      title ? React.createElement('strong', { key: 'title' }, title) : null,
      description ? React.createElement('p', { key: 'description' }, description) : null,
    ])
  );

const Input = React.forwardRef(function MockInput(
  { label, isRequired, ...rest },
  ref
) {
  return React.createElement(
    'label',
    null,
    renderChildren(
      React.createElement('input', {
        ref,
        'aria-label': label,
        required: isRequired,
        ...rest,
      }),
      [label]
    )
  );
});

const Textarea = React.forwardRef(function MockTextarea(
  { label, isRequired, ...rest },
  ref
) {
  return React.createElement(
    'label',
    null,
    renderChildren(
      React.createElement('textarea', {
        ref,
        'aria-label': label,
        required: isRequired,
        ...rest,
      }),
      [label]
    )
  );
});

const Progress = ({ value, ...rest }) =>
  React.createElement('progress', { value, ...rest });

module.exports = new Proxy(
  {
    Alert,
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Form,
    HeroUIProvider,
    Input,
    Progress,
    Snippet,
    Textarea,
  },
  {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }

      return createWrapper('div');
    },
  }
);
