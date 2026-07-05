import { useCallback, useRef } from 'react';

interface Props {
	loadMore: () => void;
	hasNext: boolean;
	loading: boolean;
	rootMargin: string;
}

export const useVirtualized = ({ loadMore, hasNext, loading, rootMargin }: Props) => {
	const observerRef = useRef<IntersectionObserver>();

	const lastElementRef = useCallback(
		(node: HTMLElement | null) => {
			if (loading) return;

			if (observerRef.current) {
				observerRef.current.disconnect();
			}

			observerRef.current = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting && hasNext) {
						loadMore();
					}
				},
				{ rootMargin },
			);

			if (node) {
				observerRef.current.observe(node);
			}
		},
		[loadMore, hasNext, loading, rootMargin],
	);

	return lastElementRef;
};
