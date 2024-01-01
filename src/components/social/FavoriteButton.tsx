import { api, isLoggedIn, type RouterOutputs } from '$/lib/api';
import { useRouter } from 'next/router';
import React, { type FunctionComponent, type ReactNode } from 'react';

interface FavoriteButtonProps {
  article: RouterOutputs['articles']['getArticles']['articles'][number];
  onToggleFavorite?: (
    article: RouterOutputs['articles']['getArticles']['articles'][number]
  ) => void;
  transformText?: (input: string) => ReactNode;
  className?: string;
}

type Props = FavoriteButtonProps;

export const FavoriteButton: FunctionComponent<Props> = ({
  className,
  article,
  onToggleFavorite,
  transformText = (e) => e,
}) => {
  const { push } = useRouter();

  const { mutate: addToFavorite } =
    api.favorites.addArticleAsFavorite.useMutation({
      onSuccess: (res) => onToggleFavorite?.(res.article),
    });
  const { mutate: removeFromFavorite } =
    api.favorites.removeArticleFromFavorite.useMutation({
      onSuccess: (res) => onToggleFavorite?.(res.article),
    });

  return (
    <button
      className={`${
        article.favorited ? 'active' : ''
      } btn btn-outline-primary btn-sm${className ? ` ${className}` : ''}`}
      onClick={() => {
        if (!isLoggedIn()) {
          return push('/register');
        }
        if (article.favorited) {
          removeFromFavorite({ slug: article.slug });
        } else {
          addToFavorite({ slug: article.slug });
        }
      }}
    >
      <i className="ion-heart" />{' '}
      {transformText(`${article.favorited ? 'Unfavorite' : 'Favorite'}`)} (
      {transformText(article.favoritesCount.toString())})
    </button>
  );
};
