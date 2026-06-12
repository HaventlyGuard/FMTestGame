namespace CommunicationTrainer.Api.Services;

public class ScoringEngine
{
    private record Profile(
        string Code,
        float IdealE, float IdealS, float IdealT,
        float TolE, float TolS, float TolT,
        float wE, float wS, float wT
    );

    private static readonly Dictionary<string, Profile> Profiles = new();

    static ScoringEngine()
    {
        var data = new (string code, float iE, float iS, float iT, float tE, float tS, float tT, float wE, float wS, float wT)[]
        {
            ("P",  3.333f, 1.167f, 1.167f,  2.0f, 1.0f, 1.0f, 0.60f, 0.20f, 0.20f),
            ("A",  1.000f, 3.333f, 0.667f,  1.0f, 1.5f, 0.8f, 0.15f, 0.70f, 0.15f),
            ("S",  1.000f, 0.667f, 3.333f,  1.0f, 0.8f, 1.5f, 0.15f, 0.15f, 0.70f),
            ("M",  0.667f, 2.500f, 2.000f, -4.0f, 1.2f, 1.0f, 0.10f, 0.50f, 0.40f),
            ("MA", 0.667f, 3.167f, 1.167f, -5.0f, 1.5f, 0.8f, 0.05f, 0.70f, 0.25f),
            ("MS", 0.667f, 2.667f, 1.833f, -5.0f, 1.2f, 1.2f, 0.05f, 0.50f, 0.45f),
            ("AP", 2.333f, 2.500f, 1.167f,  1.5f, 1.5f, 1.0f, 0.35f, 0.45f, 0.20f),
            ("SP", 2.333f, 1.167f, 2.500f,  1.5f, 1.0f, 1.5f, 0.35f, 0.20f, 0.45f),
            ("PS", 2.500f, 1.167f, 2.333f,  1.2f, 0.8f, 1.2f, 0.40f, 0.20f, 0.40f),
            ("PA", 2.500f, 2.333f, 1.167f,  1.2f, 1.2f, 0.8f, 0.40f, 0.40f, 0.20f),
        };

        foreach (var d in data)
            Profiles[d.code] = new Profile(d.code, d.iE, d.iS, d.iT, d.tE, d.tS, d.tT, d.wE, d.wS, d.wT);
    }

    public float Evaluate(List<(float E, float S, float T)> phrases, string targetCode)
    {
        var profile = Profiles[targetCode];

        var scores = phrases.Select(phrase =>
        {
            var sE = ParamScore(phrase.E, profile.IdealE, profile.TolE);
            var sS = ParamScore(phrase.S, profile.IdealS, profile.TolS);
            var sT = ParamScore(phrase.T, profile.IdealT, profile.TolT);
            return sE * profile.wE + sS * profile.wS + sT * profile.wT;
        }).ToArray();

        var harmonic = 3f / (1f / Math.Max(0.001f, scores[0]) +
                             1f / Math.Max(0.001f, scores[1]) +
                             1f / Math.Max(0.001f, scores[2]));

        var min = Math.Min(scores[0], Math.Min(scores[1], scores[2]));
        var max = Math.Max(scores[0], Math.Max(scores[1], scores[2]));
        var consistency = max > 0.001f ? min / max : 0;

        var result = (harmonic * 0.7f + harmonic * consistency * 0.3f) * 100f;
        return Math.Clamp(result, 0, 100);
    }

    private float ParamScore(float fact, float ideal, float tol)
    {
        if (ideal < 0.001f) return fact < 0.001f ? 1f : 0f;

        if (tol >= 0)
        {
            var ratio = fact / ideal;
            if (ratio >= 1f)
                return MathF.Exp(-(ratio - 1f) / tol);
            else
                return ratio;
        }
        else
        {
            var absTol = MathF.Abs(tol);
            if (fact <= ideal) return 1f;
            return MathF.Exp(-(fact - ideal) / ideal * absTol);
        }
    }
}