import { Helmet } from 'react-helmet-async';
import seoConfig from '../config/seoConfig';

/**
 * SEO Component để set meta tags cho page
 * @param {string} page - Tên page (home, about, classes, etc.)
 * @param {string} customTitle - Title tùy chỉnh (nếu cần)
 * @param {string} customDescription - Description tùy chỉnh (nếu cần)
 */
const SEO = ({ page, customTitle = null, customDescription = null }) => {
    const config = seoConfig[page] || seoConfig.home;

    return (
        <Helmet>
            <title>{customTitle || config.title}</title>
            <meta name="description" content={customDescription || config.description} />
            <meta name="keywords" content={config.keywords} />

            {/* Open Graph */}
            <meta property="og:title" content={customTitle || config.title} />
            <meta property="og:description" content={customDescription || config.description} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Sakae Tiếng Nhật" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={customTitle || config.title} />
            <meta name="twitter:description" content={customDescription || config.description} />

            <html lang="vi" />
        </Helmet>
    );
};

export default SEO;
