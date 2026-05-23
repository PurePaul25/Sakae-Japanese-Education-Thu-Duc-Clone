import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR =
    'https://res.cloudinary.com/sakae-academy/image/upload/v1715617260/sakae-academy/users/sakae-default-user-avatar.png';

/**
 * Clickable user avatar + name that navigates to /nguoi-dung/:id
 * Props:
 *   user: { id, fullName, avatar, role }
 *   avatarSize: tailwind class e.g. 'w-10 h-10'
 *   showName: boolean (default true)
 *   className: extra wrapper classes
 *   children: extra content after name
 */
const UserLink = ({ user, avatarSize = 'w-9 h-9', showName = true, className = '', children }) => {
    const navigate = useNavigate();

    if (!user) return null;

    const handleClick = (e) => {
        e.stopPropagation();
        navigate(`/nguoi-dung/${user.id}`);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`flex items-center gap-2.5 min-w-0 cursor-pointer bg-transparent border-none outline-none p-0 ${className}`}
        >
            {avatarSize !== 'w-0 h-0' && (
                <div className={`${avatarSize} rounded-full overflow-hidden flex-shrink-0 border border-slate-200 bg-slate-50 transition-all`}>
                    <img
                        src={user.avatar || DEFAULT_AVATAR}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            {showName && (
                <span className="font-extrabold text-slate-800 dark:text-white text-sm truncate hover:underline transition-colors">
                    {user.fullName}
                </span>
            )}
            {children}
        </button>
    );
};

export default UserLink;
