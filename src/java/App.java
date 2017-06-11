import org.languagetool.Language;
import org.languagetool.Languages;
import java.io.*;
import java.nio.file.*;
import java.util.regex.*;
import java.util.stream.*;
import java.util.List;

class App {

    public static String replaceTemplate(String find, String replace, String text) {
        String regex = Pattern.quote("${" + find + "}");
        return text.replaceAll(regex, replace);
    }

    public static Stream<Language> getLanguageAndVariants(Language language) {
        return Languages.get().stream().filter(l -> l.getShortCode() == language.getShortCode());
    }

    public static String replaceLanguageTemplates(Language language, String text) {
        String withName = replaceTemplate("Language", language.getName(), text);
        String withShortCode = replaceTemplate("short code", language.getShortCode(), withName);
        return replaceTemplate("all variants as markdown",
                Stream.concat(Stream.of(language.getShortCode()),
                        getLanguageAndVariants(language).map(l -> l.getShortCodeWithCountryAndVariant())).distinct()
                        .collect(Collectors.joining("\n* ")),
                withShortCode);
    }

    public static void writeReadme(Language language) throws IOException {
        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
        InputStream in = classloader.getResourceAsStream("README.md");
        BufferedReader reader = new BufferedReader(new InputStreamReader(in));
        Stream<String> lines = reader.lines().map(ln -> replaceLanguageTemplates(language, ln));
        Files.write(Paths.get("README.md"), lines.collect(Collectors.toList()));
    }

    public static Language getUniquelySupportedLanguage() {
        List<Language> installedLanguages = Languages.get().stream().filter(l -> !l.isVariant())
                .collect(Collectors.toList());

        if (installedLanguages.size() != 1){
            throw new IllegalStateException("Only one language should be installed, but found " + installedLanguages.size());
        }

        return installedLanguages.get(0);
    }

    public static void main(String[] args) throws IOException {
        Language language = getUniquelySupportedLanguage();
        writeReadme(language);
    }
}