import { ArticleListTabs } from '$/components/article/ArticleListTabs'
import { FollowButton } from '$/components/social/FollowButton'
import { Layout } from '$/pages/Layout'
import { api, useIsLoggedIn } from '$/lib/api'
import { type NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

const Login: NextPage = () => {
  const { query } = useRouter()
  const isLoggedIn = useIsLoggedIn()

  // Get user to view profile
  const { data: { profile: user } = {}, isLoading, refetch } = api.profiles.getProfileByName.useQuery(
    { username: decodeURIComponent(query.username as string) })

  // Check if this is the logged-in user's profile
  const { data: { user: me }={} } = api.auth.me.useQuery(undefined, { enabled: !!isLoggedIn })
  const isOwnProfile = user?.username === me?.username

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Not logged in</div>
  }

  return <Layout>
    <div className='profile-page'>
      <div className='user-info'>
        <div className='container'>
          <div className='row'>
            <div className='col-xs-12 col-md-10 offset-md-1'>
              {
                user.image && <>
                  {/* eslint-disable-next-line @next/next/no-img-element */ }
                      <img
                          src={ user.image }
                          alt={ 'Profile picture' }
                          className='user-img'
                      />
                  </>
              }
              <h4>{ user.username }</h4>
              <p>{ user.bio }</p>
              {
                isOwnProfile && <Link
                      href='/settings'
                      className='btn btn-sm btn-outline-secondary action-btn'
                  >
                      <i className='ion-gear-a' /> Edit Profile Settings
                  </Link>
              }
              <FollowButton
                user={ user }
                onSuccess={ refetch }
                isOwnProfile={ isOwnProfile }
              />
            </div>
          </div>
        </div>
      </div>

      <div className='container'>
        <div className='row'>
          <ArticleListTabs
            className='col-xs-12 col-md-10 offset-md-1'
            toggleClassName='articles-toggle'
            tabs={ ['personal', 'favourite'] }
            defaultTab='personal'
            username={ query.username as string }
          />
        </div>
      </div>
    </div>
  </Layout>
}

export default Login