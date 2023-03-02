import * as React from 'react';
import cx from 'clsx';

import ContentfulImage from '@madeinhaus/contentful-image';

import styles from './ContentfulImageDemo.module.css';

const ContentfulImageDemo: React.FC = () => {
    return (
        <div className={styles.root}>
            <ContentfulImage
                priority={false}
                fallbackImageWidth={1280}
                customSources={[
                    { breakpoint: 1024, imageWidth: 1024 * 1.5 },
                    { breakpoint: 768, imageWidth: 768 * 1.5 },
                    { imageWidth: 768 },
                ]}
                src="https://images.ctfassets.net/j8tkpy1gjhi5/1sNDo90vR4xXAv1RdrQFki/1fe19001c36da6b7f9d0afd5745a930f/Frame_1826.png"
                alt=""
            />
        </div>
    );
};

export default ContentfulImageDemo;
