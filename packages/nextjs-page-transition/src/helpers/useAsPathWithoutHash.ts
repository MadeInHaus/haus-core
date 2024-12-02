import { useRouter } from 'next/router';
import { removeHash } from '../../../utils';

export const useAsPathWithoutHash = (): string => {
    const router = useRouter();
    return removeHash(router.asPath);
};
